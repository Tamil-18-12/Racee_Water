import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless environment (/var/task is read-only), use /tmp directory
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists safely without crashing read-only serverless runtime
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Could not create local data directory:', err.message);
}

let db = {
  owners: [],
  settings: [],
  customers: [],
  orders: [],
};

// Load database from file
const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      if (!db.owners) db.owners = [];
      if (!db.settings) db.settings = [];
      if (!db.customers) db.customers = [];
      if (!db.orders) db.orders = [];
    }
  } catch (e) {
    console.warn('⚠️ Error reading local db file, initializing empty db:', e.message);
  }
};

// Save database to file
const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('❌ Error saving local db file:', e.message);
  }
};

loadDB();

const createObjectId = () => crypto.randomBytes(12).toString('hex');

const matchesQuery = (item, query = {}) => {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, value] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatch = value.some((condition) => matchesQuery(item, condition));
      if (!orMatch) return false;
      continue;
    }

    if (value instanceof RegExp) {
      if (!value.test(String(item[key] || ''))) return false;
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      if (value.$ne !== undefined && String(item[key]) === String(value.$ne)) return false;
      if (value.$gte !== undefined) {
        const valA = typeof item[key] === 'number' ? item[key] : new Date(item[key]);
        const valB = typeof value.$gte === 'number' ? value.$gte : new Date(value.$gte);
        if (valA < valB) return false;
      }
      if (value.$lte !== undefined) {
        const valA = typeof item[key] === 'number' ? item[key] : new Date(item[key]);
        const valB = typeof value.$lte === 'number' ? value.$lte : new Date(value.$lte);
        if (valA > valB) return false;
      }
      if (value.$gt !== undefined) {
        const valA = typeof item[key] === 'number' ? item[key] : new Date(item[key]);
        const valB = typeof value.$gt === 'number' ? value.$gt : new Date(value.$gt);
        if (valA <= valB) return false;
      }
      if (value.$lt !== undefined) {
        const valA = typeof item[key] === 'number' ? item[key] : new Date(item[key]);
        const valB = typeof value.$lt === 'number' ? value.$lt : new Date(value.$lt);
        if (valA >= valB) return false;
      }
      continue;
    }

    if (key === '_id' || key === 'id') {
      if (String(item._id) !== String(value) && String(item.id) !== String(value)) return false;
      continue;
    }

    if (key === 'customerId') {
      if (String(item.customerId) !== String(value)) return false;
      continue;
    }

    if (String(item[key]) !== String(value)) return false;
  }

  return true;
};

// Wrap item with document helpers (save, toJSON, comparePassword)
const wrapDoc = (item, collectionName) => {
  if (!item) return null;

  const doc = { ...item };
  doc._id = item._id || item.id || createObjectId();
  doc.id = doc._id.toString();

  doc.toJSON = function () {
    const copy = { ...this };
    copy.id = copy._id.toString();
    if (copy.passwordHash) delete copy.passwordHash;
    return copy;
  };

  doc.save = async function () {
    this.updatedAt = new Date();
    const collection = db[collectionName];
    const index = collection.findIndex((x) => String(x._id) === String(this._id));
    const cleanDoc = { ...this };
    delete cleanDoc.save;
    delete cleanDoc.toJSON;
    delete cleanDoc.comparePassword;

    if (index >= 0) {
      collection[index] = cleanDoc;
    } else {
      collection.push(cleanDoc);
    }
    saveDB();
    return wrapDoc(cleanDoc, collectionName);
  };

  if (collectionName === 'owners') {
    doc.comparePassword = async function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.passwordHash);
    };
  }

  return doc;
};

class LocalQuery {
  constructor(collectionName, query = {}) {
    this.collectionName = collectionName;
    this.query = query;
    this._sort = null;
    this._limit = null;
    this._skip = 0;
  }

  sort(sortCriteria) {
    this._sort = sortCriteria;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  skip(num) {
    this._skip = num;
    return this;
  }

  select() {
    return this;
  }

  populate() {
    return this;
  }

  async exec() {
    loadDB();
    let items = (db[this.collectionName] || []).filter((item) => matchesQuery(item, this.query));

    if (this._sort && typeof this._sort === 'object') {
      const [field, direction] = Object.entries(this._sort)[0] || [];
      if (field) {
        const dir = direction === -1 || direction === 'desc' ? -1 : 1;
        items = [...items].sort((a, b) => {
          const valA = a[field] instanceof Date ? a[field].getTime() : (a[field] ?? '');
          const valB = b[field] instanceof Date ? b[field].getTime() : (b[field] ?? '');
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
          return 0;
        });
      }
    }

    if (this._skip > 0) {
      items = items.slice(this._skip);
    }
    if (typeof this._limit === 'number' && this._limit >= 0) {
      items = items.slice(0, this._limit);
    }

    return items.map((i) => wrapDoc(i, this.collectionName));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

export const createLocalModel = (collectionName) => {
  return {
    find: (query = {}) => {
      return new LocalQuery(collectionName, query);
    },
    findOne: async (query = {}) => {
      loadDB();
      const item = db[collectionName].find((i) => matchesQuery(i, query));
      return item ? wrapDoc(item, collectionName) : null;
    },
    findById: async (id) => {
      loadDB();
      const item = db[collectionName].find(
        (i) => String(i._id) === String(id) || String(i.id) === String(id)
      );
      return item ? wrapDoc(item, collectionName) : null;
    },
    findByIdAndDelete: async (id) => {
      loadDB();
      const index = db[collectionName].findIndex(
        (i) => String(i._id) === String(id) || String(i.id) === String(id)
      );
      if (index >= 0) {
        const deleted = db[collectionName].splice(index, 1)[0];
        saveDB();
        return wrapDoc(deleted, collectionName);
      }
      return null;
    },
    create: async (data) => {
      loadDB();
      const newDoc = {
        ...data,
        _id: createObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db[collectionName].push(newDoc);
      saveDB();
      return wrapDoc(newDoc, collectionName);
    },
    countDocuments: async (query = {}) => {
      loadDB();
      return db[collectionName].filter((item) => matchesQuery(item, query)).length;
    },
  };
};
