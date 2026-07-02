import { DatabaseSync } from 'node:sqlite';

class Statement {
  constructor(result = {}) {
    this.lastID = Number(result.lastInsertRowid ?? 0);
    this.changes = Number(result.changes ?? 0);
  }
}

function normalizeCallbackAndParameters(parameters, callback) {
  if (typeof parameters === 'function') {
    return {
      parameters: [],
      callback: parameters,
    };
  }

  return {
    parameters: parameters ?? [],
    callback,
  };
}

function bind(statement, parameters, method) {
  if (Array.isArray(parameters)) {
    return statement[method](...parameters);
  }

  if (parameters && typeof parameters === 'object') {
    return statement[method](parameters);
  }

  return statement[method]();
}

class Database {
  constructor(filename, mode, callback) {
    this.filename = filename;
    this.database = new DatabaseSync(filename);
    this.database.exec('PRAGMA busy_timeout = 5000;');
    this.database.exec('PRAGMA foreign_keys = ON;');

    queueMicrotask(() => callback?.(null));
  }

  serialize(callback) {
    callback();
  }

  run(sql, parameters, callback) {
    const args = normalizeCallbackAndParameters(parameters, callback);

    try {
      const result = bind(this.database.prepare(sql), args.parameters, 'run');
      args.callback?.call(new Statement(result), null);
    } catch (error) {
      args.callback?.(error);
    }

    return this;
  }

  all(sql, parameters, callback) {
    const args = normalizeCallbackAndParameters(parameters, callback);

    try {
      const rows = bind(this.database.prepare(sql), args.parameters, 'all');
      args.callback?.call({}, null, rows);
    } catch (error) {
      args.callback?.(error);
    }

    return this;
  }

  get(sql, parameters, callback) {
    const args = normalizeCallbackAndParameters(parameters, callback);

    try {
      const row = bind(this.database.prepare(sql), args.parameters, 'get');
      args.callback?.call({}, null, row);
    } catch (error) {
      args.callback?.(error);
    }

    return this;
  }

  close(callback) {
    try {
      this.database.close();
      callback?.(null);
    } catch (error) {
      callback?.(error);
    }
  }
}

export default {
  Database,
  OPEN_READWRITE: 0x00000002,
  OPEN_CREATE: 0x00000004,
};
