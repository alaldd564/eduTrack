'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRole } from '@/lib/role-context'
import {
  createDiscussionPost,
  createDiscussionReply,
  fetchDiscussionPosts,
  fetchDiscussionReplies,
} from '@/lib/api-client'
import type { DiscussionPost, DiscussionReply } from '@/lib/types'
import { MessageSquare, Reply, Send } from 'lucide-react'

export function CommunityBoard() {
  const { role } = useRole()
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [replies, setReplies] = useState<DiscussionReply[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [replyContent, setReplyContent] = useState('')

  const loadPosts = useCallback(async () => {
    const data = await fetchDiscussionPosts()
    setPosts(data)
    setSelectedPostId((prev) => prev ?? data[0]?.id ?? null)
  }, [])

  const loadReplies = useCallback(async (postId: string) => {
    const data = await fetchDiscussionReplies(postId)
    setReplies(data)
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  useEffect(() => {
    if (selectedPostId) {
      void loadReplies(selectedPostId)
    }
  }, [selectedPostId, loadReplies])

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      return
    }
    await createDiscussionPost({ title: title.trim(), content: content.trim() })
    setTitle('')
    setContent('')
    await loadPosts()
  }

  const handleReply = async () => {
    if (!selectedPostId || !replyContent.trim()) {
      return
    }
    await createDiscussionReply(selectedPostId, { content: replyContent.trim() })
    setReplyContent('')
    await loadReplies(selectedPostId)
  }

  const selectedPost = posts.find((post) => post.id === selectedPostId) || posts[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">커뮤니티</h2>
        <p className="text-muted-foreground">질문과 답글로 수업 내용을 이어갑니다.</p>
      </div>

      {role === 'instructor' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-primary" />
              새 공지/질문 작성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleCreatePost} className="gap-2">
              <Send className="h-4 w-4" />
              게시하기
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">게시글 목록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedPostId === post.id ? 'border-primary bg-primary/10' : 'border-border bg-background'
                }`}
              >
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.authorName} · {post.createdAt}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">게시글 상세</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPost ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedPost.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedPost.authorName} · {selectedPost.createdAt}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">
                    {selectedPost.content}
                  </p>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-secondary p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Reply className="h-4 w-4 text-primary" />
                    답글
                  </div>
                  {replies.length > 0 ? (
                    replies.map((reply) => (
                      <div key={reply.id} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-sm text-foreground">{reply.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {reply.authorName} · {reply.createdAt}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">아직 답글이 없습니다.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="답글 작성"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <Button onClick={handleReply}>답글 달기</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">게시글을 선택하세요.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
