import type { Route } from './+types/home'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: '落とし物管理システム' },
    { name: 'description', content: 'Welcome to React Router!' },
  ]
}

export default function Home() {
  return (
    <div>
      <p>this is the home page</p>
    </div>
  )
}
