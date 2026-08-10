import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { Dashboard } from './components/Dashboard'
import { StudentPage } from './components/StudentPage'
import { TeachingPage } from './components/TeachingPage'
import { TopicPage } from './components/TopicPage'
import { completeTopic, getEducatorSummary, revealAnswer, startEducatorSession, type EducatorSummary } from './data/quizApi'
import { getTopic, topics } from './data/topics'
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
  const [educatorSummary, setEducatorSummary] = useState<EducatorSummary | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const topic = route.page === 'dashboard' ? undefined : getTopic(route.topicId)

  useEffect(() => {
    if (route.page !== 'topic' || !topic) {
      setEducatorSummary(null)
      return
    }

    let cancelled = false
    const topicId = topic.id
    setApiError(null)

    async function loadSession() {
      let summary = await getEducatorSummary(topicId)
      if (!summary.active) summary = await startEducatorSession(topicId)
      if (!cancelled) setEducatorSummary(summary)
    }

    void loadSession().catch((error) => {
      if (!cancelled) setApiError(error instanceof Error ? error.message : 'Unable to load the educator session.')
    })

    const intervalId = window.setInterval(() => {
      void getEducatorSummary(topicId).then((summary) => {
        if (!cancelled) setEducatorSummary(summary)
      }).catch(() => undefined)
    }, 2000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [route, topic])

  function navigate(path: string) {
    window.history.pushState({}, '', path)
    setRoute(getRoute(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function markComplete(topicId: string) {
    setCompletedTopicIds((current) => new Set([...current, topicId]))
  }

  async function finishTopic(topicId: string) {
    await completeTopic(topicId)
    markComplete(topicId)
  }

  async function openTeaching(topicId: string) {
    try {
      await finishTopic(topicId)
      navigate(`/topics/${topicId}/learn`)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to complete this topic.')
    }
  }

  async function resetRotation() {
    try {
      await Promise.all(topics.map((item) => completeTopic(item.id)))
      setCompletedTopicIds(new Set())
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to reset the rotation.')
    }
  }

  const topicPath = topic ? `/topics/${topic.id}` : '/'
  const studentUrl = topic ? `${window.location.origin}${topicPath}/respond` : ''

  if (route.page === 'student' && topic) return <StudentPage topic={topic} />

  return <div className="app-shell"><AppHeader canReset={completedTopicIds.size > 0} onHome={() => navigate('/')} onReset={() => { void resetRotation() }} />{apiError && <p className="submission-status" role="alert">{apiError}</p>}{route.page === 'dashboard' || !topic ? <Dashboard completedTopicIds={completedTopicIds} onSelectTopic={(topicId) => navigate(`/topics/${topicId}`)} /> : route.page === 'teaching' ? <TeachingPage onBack={() => navigate(topicPath)} onDashboard={() => navigate('/')} topic={topic} /> : educatorSummary ? <TopicPage correctAnswerIndex={educatorSummary.correctAnswerIndex ?? 0} isComplete={completedTopicIds.has(topic.id)} isRevealed={educatorSummary.revealed} onBack={() => navigate('/')} onLearnMore={() => { void openTeaching(topic.id) }} onMarkComplete={() => { void finishTopic(topic.id).then(() => navigate('/')).catch((error) => setApiError(error instanceof Error ? error.message : 'Unable to complete this topic.')) }} onRevealAnswer={() => { void revealAnswer(topic.id).then(setEducatorSummary).catch((error) => setApiError(error instanceof Error ? error.message : 'Unable to reveal the answer.')) }} responseCounts={educatorSummary.responseCounts} topic={topic} topicUrl={studentUrl} /> : <main />}</div>
}

export default App
