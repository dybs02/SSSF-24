import {promisePool} from '../../database/db';
import CustomError from '../../classes/CustomError';
import {ResultSetHeader, RowDataPacket} from 'mysql2';
import {Cat} from '../../types/DBTypes';
import {MessageResponse, UploadResponse} from '../../types/MessageTypes';

const getAllCats = async (): Promise<Cat[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Cat[]>(
    `
    SELECT cat_id, cat_name, weight, filename, birthdate, ST_X(coords) as lat, ST_Y(coords) as lng,
    JSON_OBJECT('user_id', sssf_user.user_id, 'user_name', sssf_user.user_name) AS owner 
	  FROM sssf_cat 
	  JOIN sssf_user 
    ON sssf_cat.owner = sssf_user.user_id
    `
  );
  if (rows.length === 0) {
    throw new CustomError('No cats found', 404);
  }
  const cats = (rows as Cat[]).map((row) => ({
    ...row,
    owner: JSON.parse(row.owner?.toString() || '{}'),
  }));

  return cats;
};

const getCat = async (id: number): Promise<Cat> => {
  const [rows] = await promisePool.execute<RowDataPacket[]>(
    `
    SELECT * FROM sssf_cat
    WHERE cat_id = ?
    `,
    [id],
  );
  
  if (!rows) {
    throw new CustomError('Cat not found', 404);
  }
  return rows[0] as Cat;
};

const addCat = async (data: Omit<Cat, 'owner'> & {owner: number}): Promise<number> => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `
    INSERT INTO sssf_cat (cat_name, weight, owner, filename, birthdate, coords) 
    VALUES (?, ?, ?, ?, ?, POINT(?, ?));
    `,
    [
      data.cat_name,
      data.weight,
      data.owner,
      data.filename,
      data.birthdate,
      data.lat,
      data.lng,
    ]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats added', 400);
  }
  const [rows] = await promisePool.execute<RowDataPacket[]>('SELECT LAST_INSERT_ID();');
  return rows[0]['LAST_INSERT_ID()'];
};

const updateCat = async (cat: Cat, id: number, user_id: number, user_role: string): Promise<MessageResponse> => {
  let query = 'UPDATE sssf_cat SET ? WHERE cat_id = ?'
  if (user_role === 'user') {
    query += ` AND owner = ?`;
  }
  console.log('updateCat', query);
  const sql = promisePool.format(query, [
    cat,
    id,
    user_id,
  ]);
  const [headers] = await promisePool.execute<ResultSetHeader>(sql);

  if (headers.affectedRows === 0) {
    throw new CustomError('No cats updated', 400);
  }
  return {message: 'Cat updated'};
};

const deleteCat = async (catId: number): Promise<MessageResponse> => {
  const [headers] = await promisePool.execute<ResultSetHeader>(
    `
    DELETE FROM sssf_cat 
    WHERE cat_id = ?;
    `,
    [catId]
  );
  if (headers.affectedRows === 0) {
    throw new CustomError('No cats deleted', 400);
  }
  return {message: 'Cat deleted'};
};

export {getAllCats, getCat, addCat, updateCat, deleteCat};
