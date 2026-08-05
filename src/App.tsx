import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { Dashboard } from './components/Dashboard'
import { StudentPage } from './components/StudentPage'
import { TeachingPage } from './components/TeachingPage'
import { TopicPage } from './components/TopicPage'
import { getTopic } from './data/topics'
import './App.css'

type Route =
  | { page: 'dashboard' }
  | { page: 'topic'; topicId: string }
  | { page: 'teaching'; topicId: string }
  | { page: 'student'; topicId: string }

function getRoute(pathname = window.location.pathname): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'topics' && parts[1]) {
    if (parts[2] === 'learn') return { page: 'teaching', topicId: parts[1] }
    if (parts[2] === 'respond') return { page: 'student', topicId: parts[1] }
    return { page: 'topic', topicId: parts[1] }
  }
  return { page: 'dashboard' }
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(path: string) {
    window.history.pushState({}, '', path)
    setRoute(getRoute(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function markComplete(topicId: string) {
    setCompletedTopicIds((current) => new Set([...current, topicId]))
  }

  function openTeaching(topicId: string) {
    markComplete(topicId)
    navigate(`/topics/${topicId}/learn`)
  }

  const topic = route.page === 'dashboard' ? undefined : getTopic(route.topicId)
  const topicPath = topic ? `/topics/${topic.id}` : '/'
  const studentUrl = topic ? `${window.location.origin}${topicPath}/respond` : ''

  if (route.page === 'student' && topic) return <StudentPage topic={topic} />

  return <div className="app-shell"><AppHeader canReset={completedTopicIds.size > 0} onHome={() => navigate('/')} onReset={() => setCompletedTopicIds(new Set())} />{route.page === 'dashboard' || !topic ? <Dashboard completedTopicIds={completedTopicIds} onSelectTopic={(topicId) => navigate(`/topics/${topicId}`)} /> : route.page === 'teaching' ? <TeachingPage onBack={() => navigate(topicPath)} onDashboard={() => navigate('/')} topic={topic} /> : <TopicPage isComplete={completedTopicIds.has(topic.id)} onBack={() => navigate('/')} onLearnMore={() => openTeaching(topic.id)} onMarkComplete={() => { markComplete(topic.id); navigate('/') }} topic={topic} topicUrl={studentUrl} />}</div>
}

export default App
