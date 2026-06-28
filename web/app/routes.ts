import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes'

export default [
  layout('routes/layout.tsx', [
    index('routes/home/route.tsx'),
    route('lost-items/:id', 'routes/lost-items.$id/route.tsx'),
  ]),
] satisfies RouteConfig
