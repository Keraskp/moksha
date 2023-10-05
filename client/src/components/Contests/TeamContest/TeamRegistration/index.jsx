import { lazy, useEffect, useState, startTransition } from 'react'
import { Link } from 'react-router-dom'
import accountMultipleIcon from '@iconify-icons/mdi/account-multiple-remove-outline'
import { isNullOrUndefined } from '@arpansaha13/utils'
import { useFetch } from '~/hooks/useFetch'
import Sheet from '~common/Sheet'
import Loader from '~common/Loader'
import EmptyState from '~common/EmptyState'

const Register = lazy(() => import('./Register'))
const Registered = lazy(() => import('./Registered'))

export default function TeamRegistration({ contest }) {
  const fetchHook = useFetch()
  const [loading, setLoading] = useState(true)
  const [createdTeam, setCreatedTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState(null)
  const [alreadyRegisteredMemberIds, setAlreadyRegisteredMemberIds] = useState(null)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    const init = async () => {
      const team = await fetchCreatedTeam(fetchHook)

      if (isNullOrUndefined(team)) return
      setCreatedTeam(team)

      const registration = await fetchRegistration(fetchHook, team.team_id, contest.id)

      if (!isNullOrUndefined(registration)) {
        setRegistration(registration)
      } else {
        const res = await Promise.all([
          fetchHook(`teams/${team.team_id}/members`),
          fetchHook(`teams/${team.team_id}/members/${contest.id}`),
        ])
        setTeamMembers(res[0].data)
        setAlreadyRegisteredMemberIds(new Set(res[1].data))
      }
    }

    init().finally(() => startTransition(() => setLoading(false)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <Loader className='w-6 mx-auto' />
  }

  if (createdTeam === null) {
    return (
      <>
        <EmptyState icon={accountMultipleIcon} title='You are not the leader of any team' />

        <div className='mt-1 mx-auto max-w-xs sm:max-w-sm text-center text-sm text-gray-400 space-y-1'>
          <p className=''>Only the leader can register in a team contest on behalf of the team.</p>
          <p>
            You can create a team{' '}
            <Link to='/teams/create' className='text-amber-600 hover:text-amber-500 font-medium transition-colors'>
              here
            </Link>
            .
          </p>
        </div>
      </>
    )
  }

  if (!isNullOrUndefined(registration)) {
    return (
      <Registered
        contestId={contest.id}
        team={createdTeam}
        registration={registration}
        setRegistration={setRegistration}
      />
    )
  }

  if (new Date() > contest.deadline) {
    return <Sheet className='p-4 sm:p-6'>Registration for this contest is closed.</Sheet>
  }

  return (
    <Register
      contest={contest}
      team={createdTeam}
      members={teamMembers}
      alreadyRegisteredMemberIds={alreadyRegisteredMemberIds}
      setRegistration={setRegistration}
    />
  )
}

async function fetchCreatedTeam(fetchHook) {
  return fetchHook('users/me/created-team').then(r => r.data)
}

async function fetchRegistration(fetchHook, teamId, contestId) {
  const params = new URLSearchParams({
    team_id: teamId,
    contest_id: contestId,
  })

  return fetchHook(`contests/team/registration?${params.toString()}`).then(r => r.data)
}
