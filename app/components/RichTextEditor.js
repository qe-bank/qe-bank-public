'use client'

import { useEffect, useMemo, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import {
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND
} from 'lexical'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { CodeNode } from '@lexical/code'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListItemNode,
  ListNode
} from '@lexical/list'
import { TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS
} from '@lexical/markdown'

function Toolbar() {
  const [editor] = useLexicalComposerContext()

  return (
    <div className="rich-editor-toolbar">
      <button type="button" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        실행 취소
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        다시 실행
      </button>
      <span className="divider" />
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        굵게
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
        기울임
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}>
        밑줄
      </button>
      <span className="divider" />
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
        글머리
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
        번호
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}>
        목록 해제
      </button>
      <span className="divider" />
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('링크 주소를 입력하세요')
          if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
          }
        }}
      >
        링크
      </button>
      <button type="button" onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}>
        링크 해제
      </button>
    </div>
  )
}

function SyncPlugin({ value, lastValueRef }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const nextValue = value || ''
    if (nextValue === lastValueRef.current) return

    editor.update(() => {
      $convertFromMarkdownString(nextValue, TRANSFORMERS)
    })
    lastValueRef.current = nextValue
  }, [editor, value, lastValueRef])

  return null
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...'
}) {
  const lastValueRef = useRef(value || '')

  const initialConfig = useMemo(
    () => ({
      namespace: 'notice-editor',
      nodes: [HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, LinkNode],
      onError(error) {
        console.error(error)
      },
      editorState: (editor) => {
        editor.update(() => {
          $convertFromMarkdownString(value || '', TRANSFORMERS)
        })
      }
    }),
    [value]
  )

  return (
    <div className="rich-editor">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="rich-editor-input" />}
          placeholder={<div className="rich-editor-placeholder">{placeholder}</div>}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              const markdown = $convertToMarkdownString(TRANSFORMERS)
              if (markdown !== lastValueRef.current) {
                lastValueRef.current = markdown
                onChange(markdown)
              }
            })
          }}
        />
        <SyncPlugin value={value} lastValueRef={lastValueRef} />
      </LexicalComposer>
    </div>
  )
}
