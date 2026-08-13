import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { I18nextProvider } from 'react-i18next'
import { describe, expect, it } from 'vitest'

import { ThemeToggle } from '@/components/common/ThemeToggle'
import { i18n } from '@/lib/i18n'

describe('theme toggle', () => {
  it('updates root theme class when toggling to dark', async () => {
    const user = userEvent.setup()
    document.documentElement.classList.remove('dark')

    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <I18nextProvider i18n={i18n}>
          <ThemeToggle />
        </I18nextProvider>
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: /theme/i }))
    await user.click(await screen.findByText(/dark/i))

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(screen.getByRole('button', { name: /theme/i }))
    const lightItem = await screen.findByRole('menuitem', { name: /light/i })
    expect(lightItem.className).toContain('text-popover-foreground')
    expect(lightItem.className).toContain('hover:text-accent-foreground')
  })
})
