import {Document, Model, Error} from 'mongoose';

import {DbContext} from '../dbContext';
import {Transaction} from '../transaction';

export interface BulkWriteResult {
  matchedCount?: number;
  insertedCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
}

export interface IRepositoryBase<
  TModel,
  TDocument extends Document,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TDocumentModel extends Model<TDocument> = Model<TDocument>
> {
  get(): Promise<TModel[]>;
  getById(id: string): Promise<TModel>;
  create(item: TModel, options?: {transaction?: Transaction}): Promise<TModel>;
  createMany(items: TModel[], options?: {transaction?: Transaction}): Promise<BulkWriteResult>;
  update(
    id: string,
    item: TModel | Record<string, unknown>,
    options?: {transaction?: Transaction},
  ): Promise<TModel>;
  updateMany(
    models: {id: string; model: TModel | Partial<TModel>}[],
    options?: {transaction?: Transaction},
  ): Promise<BulkWriteResult>;
  delete(id: string, options?: {transaction?: Transaction}): Promise<TModel>;
  validateBySchema(model: TModel): Promise<Error.ValidationError>;
}

export abstract class RepositoryBase<
  TModel,
  TDocument extends Document,
  TDocumentModel extends Model<TDocument> = Model<TDocument>
> implements IRepositoryBase<TModel, TDocument, TDocumentModel> {
  constructor(protected context: DbContext) {}

  protected abstract get model(): TDocumentModel;

  public async get(): Promise<TModel[]> {
    return await this.model.find().lean().exec();
  }

  public async getById(id: string): Promise<TModel> {
    return await this.model.findById(id).lean().exec();
  }

  public async create(item: TModel, options?: {transaction?: Transaction}): Promise<TModel> {
    const session = options && options.transaction && options.transaction.session;
    const collectionExists = await this.context.collectionExists(this.model.collection.name);

    if (!collectionExists) {
      await this.model.createCollection();
    }

    const documents = await this.model.create([item], {session});

    return {
      ...item,
      _id: documents[0].id,
      createdAt: (documents[0] as any).createdAt,
    };
  }

  public async createMany(
    items: TModel[],
    options?: {transaction?: Transaction},
  ): Promise<BulkWriteResult> {
    const session = options && options.transaction && options.transaction.session;
    const collectionExists = await this.context.collectionExists(this.model.collection.name);

    if (!collectionExists) {
      await this.model.createCollection();
    }

    const documents = await this.model.create(items, {session});

    return {insertedCount: documents.length};
  }

  public async update(
    id: string,
    item: TModel | Record<string, unknown>,
    options?: {transaction?: Transaction},
  ): Promise<TModel> {
    const session = options && options.transaction && options.transaction.session;

    return this.model.findOneAndUpdate({_id: id}, item, {session}).lean().exec();
  }

  public async updateMany(
    models: {id: string; model: TModel | Partial<TModel>}[],
    options?: {transaction?: Transaction},
  ): Promise<BulkWriteResult> {
    const session = options && options.transaction && options.transaction.session;
    const operations = [];

    for (const model of models) {
      operations.push({
        updateOne: {
          filter: {_id: model.id},
          update: model.model,
        },
      });
    }

    if (operations.length === 0) {
      return {
        matchedCount: 0,
        modifiedCount: 0,
      };
    }

    const result = await this.model.bulkWrite(operations, {session});

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  public async delete(id: string, options?: {transaction?: Transaction}): Promise<TModel> {
    const session = options && options.transaction && options.transaction.session;

    return this.model.findOneAndDelete({_id: id}, {session}).lean().exec();
  }

  public async validateBySchema(model: TModel): Promise<Error.ValidationError> {
    return new Promise((resolve) => {
      const instance = new this.model(model);

      instance.validate((err) => resolve(err));
    });
  }
}
