import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

const tableName = 'posts';

enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({ name: 'posts.db', location: 'default' });
};

export const createTable = async (db: SQLiteDatabase) => {
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}
                 (
                     id
                     INTEGER
                     PRIMARY
                     KEY
                     AUTOINCREMENT,
                     postId
                     INTEGER,
                     json
                     TEXT,
                     downloadDate
                     DATETIME
                 );`;
  await db.executeSql(query);
};

export const insertArticle = async (db: SQLiteDatabase, postId: number, json: string, downloadDate: string) => {
  const query = `INSERT INTO ${tableName} (postId, json, downloadDate)
                 VALUES (?, ?, ?)`;
  const values = [postId, json, downloadDate];
  await db.executeSql(query, values);
};

export const deleteTable = async (db: SQLiteDatabase) => {
  const query = `drop table ${tableName}`;
  await db.executeSql(query);
};
