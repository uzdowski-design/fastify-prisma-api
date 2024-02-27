import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import userRoutes from './modules/user/user.route';
import productRoutes from './modules/product/product.route';
import { userSchemas } from './modules/user/user.schema';
import { productSchemas } from './modules/product/product.schema';
import { version } from '../package.json';

export const server = Fastify();

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

server.register(jwt, {
  secret: 'asdasdaswmikasdjaokjmasdasdkasmkokmoasd'
});

server.decorate(
  'authenticate',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.send(error);
    }
  }
);

server.get('/_healthcheck', async () => {
  return { status: 'ok' };
});

async function main() {
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  server.register(swagger, {
    mode: 'dynamic',
    openapi: {
      info: {
        title: 'Fastify Prisma API',
        version
      },
      servers: [{ url: 'http://localhost:3000', description: 'development' }]
    }
  });
  server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  });

  server.register(userRoutes, { prefix: '/api/users' });
  server.register(productRoutes, { prefix: '/api/products' });

  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3000');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
