import { memo } from 'react'
import { Link } from 'react-router-dom'
import { isNullOrUndefined } from '@arpansaha13/utils'
import Sheet from '~common/Sheet'
import Loader from '~common/Loader'
import EmptyState from '~common/EmptyState'
import TeamData from '~/components/Teams/TeamData'
import RegisteredContestMembers from '~/components/Teams/RegisteredContestMembers'
import { getContestInPage } from '~loaders/contests.loader'
import { useRegistrationsController } from './registrations.controller'

export const loader = getContestInPage

interface MyRegistrationProps {
  reg: any
  fromCreatedTeam: boolean
}

interface CreatedTeamRegistrationProps {
  reg: any
}

interface RegistrationProps {
  reg: any
}

export function Component() {
  const { reg, loading, createdTeamReg, fromCreatedTeam, hasCreatedTeam } = useRegistrationsController()

  if (loading) {
    return <Loader className='mx-auto w-6 h-6' />
  }

  return (
    <div className='space-y-6'>
      <MyRegistration reg={reg} fromCreatedTeam={fromCreatedTeam} />

      {hasCreatedTeam && !fromCreatedTeam && <CreatedTeamRegistration reg={createdTeamReg} />}
    </div>
  )
}

Component.displayName = 'ContestRegistrations'

function MyRegistration({ reg, fromCreatedTeam }: MyRegistrationProps) {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl sm:text-2xl font-bold'>My registration</h2>
        <p className='text-sm text-gray-400'>Registration specific to your participation in this contest.</p>

        {!isNullOrUndefined(reg) && (
          <p className='mt-1 text-sm text-gray-400'>
            {fromCreatedTeam ? (
              <span>
                You have registered from your created team - <em>{reg.team.team_name}</em>
              </span>
            ) : (
              <span>You have registered in this contest from this team:</span>
            )}
          </p>
        )}
      </div>

      {isNullOrUndefined(reg) ? (
        <Sheet className='p-4'>
          <EmptyState title='No registration found' description='You have not registered in this contest' />
        </Sheet>
      ) : (
        <Registration reg={reg} />
      )}
    </div>
  )
}

function CreatedTeamRegistration({ reg }: CreatedTeamRegistrationProps) {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-xl sm:text-2xl font-bold'>My created team</h2>
        <p className='text-sm text-gray-400'>Registration in this contest from your created team.</p>
      </div>

      {isNullOrUndefined(reg) ? (
        <Sheet className='p-4'>
          <EmptyState title='No registration found' description='Your team has not registered in this contest' />
        </Sheet>
      ) : (
        <Registration reg={reg} />
      )}
    </div>
  )
}

const Registration = memo(({ reg }: RegistrationProps) => {
  return (
    <Sheet className='px-6 py-4'>
      <h3 className='mb-2 text-xl font-semibold'>
        <Link to={`/teams/${reg.team.team_id}`} className='text-amber-500 hover:underline'>
          {reg.team.team_name}
        </Link>
      </h3>

      <TeamData team={reg.team} />

      <h4 className='mt-6 mb-2 text-lg text-gray-300 font-semibold'>Participating members</h4>

      <RegisteredContestMembers members={reg.registered_members} />
    </Sheet>
  )
})
