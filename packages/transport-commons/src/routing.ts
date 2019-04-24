// @ts-ignore
import Router from 'radix-router';
import { stripSlashes } from '@feathersjs/commons';
import { Application, Service } from '@feathersjs/feathers';

export const ROUTER = Symbol('@feathersjs/transport-commons/router');

declare module '@feathersjs/feathers' {
  interface Application<ServiceTypes> {
    lookup (path: string): { [key: string]: string };
  }
}

export type LookupResult = {
  path: string,
  params: { [key: string]: any },
  service: Service<any>
}

export const routing = () => (app: Application) => {
  if (typeof app.lookup === 'function') {
    return;
  }

  const router = new Router();

  Object.assign(app, {
    [ROUTER]: router,
    lookup (path: string): LookupResult {
      if (!path) {
        return null;
      }

      return this[ROUTER].lookup(stripSlashes('' + path) || '/');
    }
  });

  // Add a mixin that registers a service on the router
  app.mixins.push((service, path) => {
    // @ts-ignore
    app[ROUTER].insert({ path, service });
    // @ts-ignore
    app[ROUTER].insert({
      path: `${path}/:__id`,
      service
    });
  });
};