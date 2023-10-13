import { startTransition, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '~/hooks/common/useFetch'
import BaseButton from '~base/BaseButton'

interface CancelRegistrationProps {
  registrationId: number | null
  setRegistrationId: React.Dispatch<React.SetStateAction<number | null>>
}

export default function CancelRegistration({ registrationId, setRegistrationId }: CancelRegistrationProps) {
  const fetchHook = useFetch()
  const [loading, setLoading] = useState(false)

  function cancelRegistration() {
    setLoading(true)

    fetchHook(`contests/solo/registration`, {
      method: 'DELETE',
      body: {
        solo_reg_id: registrationId,
      },
    }).then(() => {
      startTransition(() => {
        setRegistrationId(null)
        setLoading(false)
      })
    })
  }

  return (
    <div>
      <p>
        Your registration has been recorded. You can see all your contest registrations{' '}
        <Link to='/account/registrations'>here</Link>.
      </p>

      <div className='not-prose'>
        <BaseButton secondary loading={loading} onClick={cancelRegistration}>
          Cancel registration
        </BaseButton>
      </div>
    </div>
  )
}
