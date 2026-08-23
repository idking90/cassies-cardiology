import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { Dashboard } from './components/Dashboard'
import { StudentPage } from './components/StudentPage'
import { TeachingPage } from './components/TeachingPage'
import { TopicPage } from './components/TopicPage'
import { ApiError, completeTopic, getEducatorIdentity, getEducatorProgress, getEducatorSummary, markEducatorTopicComplete, resetEducatorProgress, revealAnswer, startEducatorSession, type EducatorSummary } from './data/quizApi'
import { getTopic } from './data/topics'
import './App.css'

type Route =
  | { page: 'dashboard' }
  | { page: 'topic'; topicId: string }
  | { page: 'teaching'; topicId: string }
  | { page: 'student'; topicId: string }
type AuthState = 'loading' | 'signed-in' | 'signed-out'

function getRoute(pathname = window.location.pathname): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'topics' && parts[1]) {
    if (parts[2] === 'learn') return { page: 'teaching', topicId: parts[1] }
    if (parts[2] === 'respond') return { page: 'student', topicId: parts[1] }
    return { page: 'topic', topicId: parts[1] }
  }
  return { page: 'dashboard' }
}

function isAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 302)
}

function App() {
  const [route, setRoute] = useState(getRoute)
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(() => new Set())
  const [educatorSummary, setEducatorSummary] = useState<EducatorSummary | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    void getEducatorIdentity().then(() => {
      setAuthState('signed-in')
      return getEducatorProgress()
    }).then((progress) => {
      setCompletedTopicIds(new Set(progress.completedTopicIds))
    }).catch((error) => {
      if (isAuthError(error)) {
        setAuthState('signed-out')
        setCompletedTopicIds(new Set())
        return
      }
      setAuthState('signed-out')
      setApiError(error instanceof Error ? error.message : 'Unable to load educator access.')
    })
  }, [])

  const topic = route.page === 'dashboard' ? undefined : getTopic(route.topicId)

  useEffect(() => {
    if (route.page !== 'topic' || !topic || authState !== 'signed-in') {
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
      if (isAuthError(error)) {
        setAuthState('signed-out')
        setEducatorSummary(null)
      } else if (!cancelled) {
        setApiError(error instanceof Error ? error.message : 'Unable to load the educator session.')
      }
    })

    const intervalId = window.setInterval(() => {
      void getEducatorSummary(topicId).then((summary) => {
        if (!cancelled) setEducatorSummary(summary)
      }).catch((error) => {
        if (isAuthError(error)) {
          setAuthState('signed-out')
          setEducatorSummary(null)
        }
      })
    }, 2000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [authState, route, topic])

  function navigate(path: string) {
    window.history.pushState({}, '', path)
    setRoute(getRoute(path))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function signIn() {
    const redirectPath = `${window.location.pathname}${window.location.search}`
    window.location.assign(`/api/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  async function signOut() {
    try {
      await fetch('/cdn-cgi/access/logout', {
        credentials: 'same-origin',
        redirect: 'manual',
      })
    } finally {
      window.location.assign('/')
    }
  }

  async function finishTopic(topicId: string) {
    if (authState !== 'signed-in') {
      signIn()
      return
    }

    try {
      await Promise.all([completeTopic(topicId), markEducatorTopicComplete(topicId)])
      setCompletedTopicIds((current) => new Set([...current, topicId]))
    } catch (error) {
      if (isAuthError(error)) {
        setAuthState('signed-out')
        return
      }
      setApiError(error instanceof Error ? error.message : 'Unable to save educator progress.')
      throw error
    }
  }

  async function openTeaching(topicId: string) {
    if (authState === 'signed-in') {
      try {
        await finishTopic(topicId)
      } catch {
        return
      }
    }
    navigate(`/topics/${topicId}/learn`)
  }

  async function resetRotation() {
    if (authState !== 'signed-in') {
      signIn()
      return
    }

    try {
      await resetEducatorProgress()
      setCompletedTopicIds(new Set())
    } catch (error) {
      if (isAuthError(error)) {
        setAuthState('signed-out')
        return
      }
      setApiError(error instanceof Error ? error.message : 'Unable to reset educator progress.')
    }
  }

  const topicPath = topic ? `/topics/${topic.id}` : '/'
  const studentUrl = topic && educatorSummary?.sessionId ? `${window.location.origin}${topicPath}/respond?session=${encodeURIComponent(educatorSummary.sessionId)}` : ''
  const isDemo = authState !== 'signed-in'

  if (route.page === 'student' && topic) return <StudentPage topic={topic} />

  return <div className="app-shell"><AppHeader authState={authState} canReset={authState === 'signed-in' && completedTopicIds.size > 0} onHome={() => navigate('/')} onReset={() => { void resetRotation() }} onSignIn={signIn} onSignOut={signOut} />{apiError && <p className="submission-status" role="alert">{apiError}</p>}{route.page === 'dashboard' || !topic ? <Dashboard completedTopicIds={completedTopicIds} onSelectTopic={(topicId) => navigate(`/topics/${topicId}`)} /> : route.page === 'teaching' ? <TeachingPage onBack={() => navigate(topicPath)} onDashboard={() => navigate('/')} topic={topic} /> : educatorSummary || isDemo ? <TopicPage correctAnswerIndex={educatorSummary?.correctAnswerIndex ?? 0} isComplete={completedTopicIds.has(topic.id)} isDemo={isDemo} isRevealed={educatorSummary?.revealed ?? false} onBack={() => navigate('/')} onLearnMore={() => { void openTeaching(topic.id) }} onMarkComplete={() => { void finishTopic(topic.id).catch(() => undefined) }} onRevealAnswer={() => { if (isDemo) signIn(); else void revealAnswer(topic.id).then(setEducatorSummary).catch((error) => setApiError(error instanceof Error ? error.message : 'Unable to reveal the answer.')) }} responseCounts={educatorSummary?.responseCounts ?? []} topic={topic} topicUrl={studentUrl} /> : <main />}</div>
}

export default App
