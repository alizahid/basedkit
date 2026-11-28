import { type Metadata } from 'next'

import { ReactHookForm } from '@/components/demos/react-hook-form'

// a test page, not in the navigation: every form component in one
// react-hook-form form
export const metadata: Metadata = {
  robots: {
    index: false,
  },
  title: 'React Hook Form',
}

export default function Page() {
  return <ReactHookForm />
}
