import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCounter } from '../apps/public/components/StatCounter'

const icon = <span data-testid="icon">★</span>

describe('StatCounter', () => {
  it('renders label and initial value', () => {
    render(<StatCounter end={10} label="Projects" icon={icon} />)
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders suffix when provided', () => {
    render(<StatCounter end={5} suffix="+" label="Years" icon={icon} />)
    expect(screen.getByText('Years')).toBeInTheDocument()
  })
})
