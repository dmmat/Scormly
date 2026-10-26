// The author's own notes for AI assistants (user-instructions.md): who the
// learners are, tone, terms, house rules. Scormly writes it from a template
// once and never rewrites it — unlike AGENTS.md, which it regenerates and
// which tells assistants to read this file first. Edited in Project settings
// (the only way for projects kept in the browser) or in the project folder.

import { useCourseStore } from '../store/courseStore'
import { readText, writeFile } from './fileSystem'
import { translate } from '../i18n/I18nProvider'

export const USER_INSTRUCTIONS_FILE = 'user-instructions.md'

/** The starting text, in the UI language. */
export function userInstructionsTemplate(): string {
  return translate('settings', 'aiTemplate')
}

// Projects without a folder keep it in memory (it travels in the .zip).
let memoryText: string | null = null

export function setMemoryUserInstructions(text: string | null): void {
  memoryText = text
}

export function getMemoryUserInstructions(): string | null {
  return memoryText
}

/** The current text; the template when the project has none yet. */
export async function readUserInstructions(
  handle: FileSystemDirectoryHandle | null = useCourseStore.getState().directoryHandle,
): Promise<string> {
  if (!handle) return memoryText ?? userInstructionsTemplate()
  try {
    return (await readText(handle, USER_INSTRUCTIONS_FILE)) ?? userInstructionsTemplate()
  } catch {
    return userInstructionsTemplate()
  }
}

export async function writeUserInstructions(text: string): Promise<void> {
  const handle = useCourseStore.getState().directoryHandle
  if (handle) await writeFile(handle, USER_INSTRUCTIONS_FILE, text)
  else memoryText = text
}

/** Create the file from the template if the project has none (best-effort). */
export async function ensureUserInstructions(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    if ((await readText(handle, USER_INSTRUCTIONS_FILE)) === null) {
      await writeFile(handle, USER_INSTRUCTIONS_FILE, userInstructionsTemplate())
    }
  } catch {
    // Convenience only.
  }
}
