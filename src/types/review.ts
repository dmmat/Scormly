// Review comments on blocks. They live in their own file next to the course
// (comments.json, see lib/comments.ts), never in project.json, so exports and
// older projects are unaffected and a project without the file simply has no
// comments.

export interface ReviewComment {
  id: string
  /** Free-text name: Scormly has no accounts (see reviewStore's `reviewer`). */
  author: string
  text: string
  /** ISO 8601 timestamps. */
  createdAt: string
  editedAt?: string
}

/** A discussion attached to one block: the first comment and its replies. */
export interface ReviewThread {
  id: string
  /** The block it is about (in a lesson or on the cover page). Threads of a
   *  deleted block are kept: undo can bring the block back. */
  blockId: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  /** Last change of any kind (reply, edit, resolve, reopen): merging two
   *  copies of a thread keeps the status of the newer one. */
  updatedAt: string
  comments: ReviewComment[]
}

/** The shape of comments.json. */
export interface CommentsFile {
  version: 1
  threads: ReviewThread[]
}
