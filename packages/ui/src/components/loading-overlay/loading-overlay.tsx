import { Overlay, type OverlayProps } from '#components/overlay/overlay.js'
import { Spinner, type SpinnerProps } from '#components/spinner/spinner.js'

export type LoadingOverlayProps = Omit<OverlayProps, 'children'> & {
  size?: SpinnerProps['size']
}

// an Overlay with a spinner on it
export function LoadingOverlay({
  size = '3',
  visible = true,
  ...props
}: LoadingOverlayProps) {
  return (
    <Overlay visible={visible} {...props}>
      <Spinner size={size} />
    </Overlay>
  )
}
