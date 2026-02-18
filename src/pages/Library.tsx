import { LibraryHeader } from '@/components/library/LibraryHeader'
import { DocumentList } from '@/components/library/DocumentList'
import { DocumentUploadProgress } from '@/components/library/DocumentUploadProgress'

function Library() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <LibraryHeader />
      <DocumentList />
      <DocumentUploadProgress />
    </div>
  )
}

export { Library }
