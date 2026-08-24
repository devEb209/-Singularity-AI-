import type { Conversation, Memory, Message, Project } from '../domain.js'
import { id, now } from '../lib/id.js'
import { NotFoundError } from '../lib/errors.js'

export class MemoryStore {
  private conversations = new Map<string, Conversation>()
  private messages = new Map<string, Message[]>()
  private projects = new Map<string, Project>()
  private memories = new Map<string, Memory>()

  createConversation(userId: string, title: string, projectId?: string) {
    const timestamp = now()
    const conversation: Conversation = { id: id('conv'), userId, title, projectId, createdAt: timestamp, updatedAt: timestamp }
    this.conversations.set(conversation.id, conversation)
    this.messages.set(conversation.id, [])
    return conversation
  }

  getConversation(conversationId: string, userId: string) {
    const conversation = this.conversations.get(conversationId)
    if (!conversation || conversation.userId !== userId) throw new NotFoundError('Conversa')
    return conversation
  }

  listConversations(userId: string) {
    return [...this.conversations.values()].filter(item => item.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  addMessage(conversationId: string, userId: string, role: Message['role'], content: string, metadata?: Message['metadata']) {
    const conversation = this.getConversation(conversationId, userId)
    const message: Message = { id: id('msg'), conversationId, role, content, metadata, createdAt: now() }
    this.messages.get(conversationId)!.push(message)
    conversation.updatedAt = message.createdAt
    return message
  }

  listMessages(conversationId: string, userId: string) {
    this.getConversation(conversationId, userId)
    return this.messages.get(conversationId) ?? []
  }

  createProject(userId: string, name: string, description = '') {
    const timestamp = now()
    const project: Project = { id: id('proj'), userId, name, description, status: 'active', createdAt: timestamp, updatedAt: timestamp }
    this.projects.set(project.id, project)
    return project
  }

  listProjects(userId: string) {
    return [...this.projects.values()].filter(item => item.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  getProject(projectId: string, userId: string) {
    const project = this.projects.get(projectId)
    if (!project || project.userId !== userId) throw new NotFoundError('Projeto')
    return project
  }

  updateProject(projectId: string, userId: string, update: Partial<Pick<Project, 'name' | 'description' | 'status'>>) {
    const project = this.getProject(projectId, userId)
    Object.assign(project, update, { updatedAt: now() })
    return project
  }

  createMemory(userId: string, content: string, kind: Memory['kind'], importance: number, projectId?: string) {
    const memory: Memory = { id: id('mem'), userId, content, kind, importance, projectId, createdAt: now() }
    this.memories.set(memory.id, memory)
    return memory
  }

  listMemories(userId: string, projectId?: string) {
    return [...this.memories.values()].filter(item => item.userId === userId && (!projectId || item.projectId === projectId))
  }

  deleteMemory(memoryId: string, userId: string) {
    const memory = this.memories.get(memoryId)
    if (!memory || memory.userId !== userId) throw new NotFoundError('Memória')
    this.memories.delete(memoryId)
  }

  clear() {
    this.conversations.clear(); this.messages.clear(); this.projects.clear(); this.memories.clear()
  }
}
