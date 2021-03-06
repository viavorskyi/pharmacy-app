import { Request, Response } from 'express';

// Enums
import { API_STATUS } from '../common/enums';

// Utils
import { CheckJwt } from '../utils/jwt';
import { RemoveUndefinedValues } from '../utils/objectfns';

// Interfaces
import { IKVObject } from '../interfaces/KVObject';
import { IUsersWS, IUsersParams } from '../interfaces/params/UsersWS';

// Controllers
import { BaseController } from './BaseController';

// Services
import { usersService } from '../services/UsersService';

const log = require('bows')('API:Controller', 'Users');

/**
 * Controller Class used to transform the request / body into our objects and send them into
 * the Service Layer
 *
 * Respond with relevant HTTP status code
 * 200 for GET
 * 201 for CREATE
 * 204 for UPDATE, PATCH and DELETE
 * 422 for Validation Failed
 */
export class UsersController extends BaseController {
  //////////////////////////////////////////////////////////////////////////
  // LIST BASED ON QUERY PARAMS - GET /api/resources?param1=x&param2=34
  //////////////////////////////////////////////////////////////////////////

  private getListParams(query: any): IUsersParams {
    const params: IUsersParams = this.GetListParams(query) as IUsersParams;

    // handle filter parameters here
    // example for input '?id=1,5,89' => id: query.id ? JSON.parse('[' + query.id + ']') : undefined,
    // id: query.id,
    // email: query.email,
    // firstName: query.firstName,
    // lastName: query.lastName,
    // phoneNumber: query.phoneNumber,
    // address1: query.address1,
    // address2: query.address2,
    // state: query.state,
    // postcode: query.postcode,
    // createdAt: query.createdAt,
    // updatedAt: query.updatedAt,
    // deletedAt: query.deletedAt,


    // example parsing arrays
    // params.id = query.id ? JSON.parse('[' + query.id + ']') : undefined;
    // params.email = query.email ? query.email.split(',') : undefined;
    // params.firstName = query.firstName ? query.firstName.split(',') : undefined;
    // params.lastName = query.lastName ? query.lastName.split(',') : undefined;
    // params.phoneNumber = query.phoneNumber ? query.phoneNumber.split(',') : undefined;
    // params.address1 = query.address1 ? query.address1.split(',') : undefined;
    // params.address2 = query.address2 ? query.address2.split(',') : undefined;
    // params.state = query.state ? query.state.split(',') : undefined;
    // params.postcode = query.postcode ? query.postcode.split(',') : undefined;
    // params.createdAt = query.createdAt ? query.createdAt.split(',') : undefined;
    // params.updatedAt = query.updatedAt ? query.updatedAt.split(',') : undefined;
    // params.deletedAt = query.deletedAt ? query.deletedAt.split(',') : undefined;


    // Join Tables
    // params.join = {
    //   UserId: query.UserId // || undefined
    // };

    // remove the FK values from the root of params object as otherwise they will get added to SQL where
    // clause if (params.join) Object.keys(params.join).forEach(key => delete params[key]);

    return params;
  }

  public async list(req: Request, res: Response): Promise<void> {
    log('list');
    try {
      // we always want to have a User (via JWT) for auditing purposes
      const token = CheckJwt(req.headers);

      // extract parent resource ids
      const parentWsIds = this.getParentResourceIds(req);

      // extract data from req - ie. do NOT send req into service layer
      const params = this.getListParams(req.query);
      log('ParentWsIds:', parentWsIds, 'Query Params:', params);

      const results = await usersService.list(token, parentWsIds, params);

      log('list: done');
      res.status(API_STATUS.OK).json(results);
    } catch (error) {
      const errorObj = this.processError(error);
      res.status(errorObj.errorCode).json(errorObj);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // GET ONE - GET /api/resources/:id
  //////////////////////////////////////////////////////////////////////////

  public async get(req: Request, res: Response): Promise<void> {
    log('get');
    try {
      // we always want to have a User (via JWT) for auditing purposes
      const token = CheckJwt(req.headers);

      // extract parent resource ids
      const parentWsIds = this.getParentResourceIds(req);

      // extract data from req - ie. do NOT send req into service layer
      const id = parseInt(req.params.id, 10);
      log('ParentWsIds:', parentWsIds, 'ID:', id);

      // create params object
      const params: IUsersParams = {
        id
      };

      const result = await usersService.get(token, parentWsIds, params);

      log('get: done');
      res.status(API_STATUS.OK).json(result);
    } catch (error) {
      const errorObj = this.processError(error);
      res.status(errorObj.errorCode).json(errorObj);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // CREATE - POST /api/resources + JSON body
  //////////////////////////////////////////////////////////////////////////

  public async create(req: Request, res: Response): Promise<void> {
    log('create');
    try {
      // we always want to have a User (via JWT) for auditing purposes
      const token = CheckJwt(req.headers);

      // extract parent resource ids
      const parentWsIds = this.getParentResourceIds(req);

      // extract data from req - ie. do NOT send req into service layer
      const ws: IUsersWS = {
        ...req.body,
        id: undefined
      };
      log('ParentWsIds:', parentWsIds, 'WS:', ws);

      const result = await usersService.create(token, parentWsIds, ws);

      log('create: done');
      res.status(API_STATUS.CREATED).json(result);
    } catch (error) {
      const errorObj = this.processError(error);
      res.status(errorObj.errorCode).json(errorObj);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // UPDATE - PUT /api/resources/:id + JSON body
  //////////////////////////////////////////////////////////////////////////

  public async update(req: Request, res: Response): Promise<void> {
    log('update');
    try {
      // we always want to have a User (via JWT) for auditing purposes
      const token = CheckJwt(req.headers);

      // extract parent resource ids
      const parentWsIds = this.getParentResourceIds(req);

      // get id of the entity
      const id = parseInt(req.params.id, 10);

      // extract data from req - ie. do NOT send req into service layer
      const ws: IUsersWS = {
        ...req.body,
        id: undefined
      };
      log('ParentWsIds:', parentWsIds, 'ID:', id, 'WS:', ws);

      await usersService.update(token, parentWsIds, id, ws);

      log('update: done');
      res.status(API_STATUS.NO_CONTENT).end();
    } catch (error) {
      const errorObj = this.processError(error);
      res.status(errorObj.errorCode).json(errorObj);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // UPDATE only some fields - PATCH /api/resources/:id + JSON body
  //////////////////////////////////////////////////////////////////////////

  public async patch(req: Request, res: Response): Promise<void> {
    log('patch');
    try {
      // we always want to have a User (via JWT) for auditing purposes
      const token = CheckJwt(req.headers);

      // extract parent resource ids
      const parentWsIds = this.getParentResourceIds(req);

      // get id of the entity
      const id = parseInt(req.params.id, 10);

      // extract data from req - ie. do NOT send req into service layer
      const ws: IUsersWS = {
        ...req.body,
        id: undefined
      };
      log('ParentWsIds:', parentWsIds, 'ID:', id, 'WS:', ws);

      await usersService.patch(token, parentWsIds, id, ws);

      log('patch: done');
      res.status(API_STATUS.NO_CONTENT).end();
    } catch (error) {
      const errorObj = this.processError(error);
      res.status(errorObj.errorCode).json(errorObj);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // DELETE - DELETE /api/resources/:id
  //////////////////////////////////////////////////////////////////////////

  public async delete(req: Request, res: Response): Promise<void> {
    log('delete');
    try {
      // we always want to have a User (via JWT) for auditing purposes
      const token = CheckJwt(req.headers);

      // extract parent resource ids
      const parentWsIds = this.getParentResourceIds(req);

      // get id of the entity
      const id = parseInt(req.params.id, 10);
      log('ParentWsIds:', parentWsIds, 'ID:', id);

      await usersService.delete(token, parentWsIds, id);

      log('delete: done');
      res.status(API_STATUS.NO_CONTENT).end();
    } catch (error) {
      const errorObj = this.processError(error);
      res.status(errorObj.errorCode).json(errorObj);
    }
  }

  //////////////////////////////////////////////////////////////////////////
  // HELPERS
  //////////////////////////////////////////////////////////////////////////

  /**
   * Extract URL path variables (representing parent resource IDs)
   * e.g. /api/resources/:ResourceId/sub-resource
   */
  protected getParentResourceIds(req: Request): IKVObject {
    return null;
    // return {
    //   // sample parent resource id validation - implement your relevant validations
    //   UserId: req.params.UserId
    // };
  }
}

export const usersController = new UsersController();

