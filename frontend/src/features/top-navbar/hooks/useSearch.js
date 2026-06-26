
import { useState, useEffect, useRef } from 'react'
import { db } from '../../../lib/db'
import { useProject } from '../../../context/ProjectContext'

export const useSearch = () => {
  const { projects } = useProject()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState({ projects: [], tasks: [], members: [] })
  const searchRef = useRef(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ projects: [], tasks: [], members: [] })
      return
    }

    const performSearch = async () => {
      const q = searchQuery.toLowerCase()
      try {
        const filteredProjects = projects.filter(
          (p) =>
            p.project_name.toLowerCase().includes(q) ||
            p.client_name.toLowerCase().includes(q)
        )

        const allMembers = await db.team_members.list()
        const filteredMembers = allMembers.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            (m.department && m.department.toLowerCase().includes(q))
        )

        const allTasks = await db.tasks.list()
        const filteredTasks = allTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.owner_name && t.owner_name.toLowerCase().includes(q))
        )

        setSearchResults({
          projects: filteredProjects.slice(0, 3),
          members: filteredMembers.slice(0, 3),
          tasks: filteredTasks.slice(0, 3),
        })
      } catch (err) {
        console.error('Search error:', err)
      }
    }

    const timer = setTimeout(performSearch, 150)
    return () => clearTimeout(timer)
  }, [searchQuery, projects])

  return {
    searchQuery, setSearchQuery,
    isSearchFocused, setIsSearchFocused,
    searchResults, setSearchResults,
    searchRef
  }
}
