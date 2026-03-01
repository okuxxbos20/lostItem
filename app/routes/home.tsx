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
      <h1>落とし物管理システム</h1>
    </div>
  )
}
