import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationScroller,
} from '@/components/ui/pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pagination with previous/next as flex siblings outside the scroll strip (recommended). Wrap with PaginationScroller when arrows need canGoPrev/canGoNext from context.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

// Default pagination
export const Default: Story = {
  render: () => (
    <PaginationScroller canGoPrev canGoNext>
      <Pagination>
        <PaginationPrevious href="#" />
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext href="#" />
      </Pagination>
    </PaginationScroller>
  ),
}

// Many pages
export const ManyPages: Story = {
  render: () => (
    <PaginationScroller canGoPrev canGoNext>
      <Pagination>
        <PaginationPrevious href="#" />
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext href="#" />
      </Pagination>
    </PaginationScroller>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pagination with many pages, showing ellipsis for skipped pages.',
      },
    },
  },
}

// First page
export const FirstPage: Story = {
  render: () => (
    <PaginationScroller canGoPrev={false} canGoNext>
      <Pagination>
        <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext href="#" />
      </Pagination>
    </PaginationScroller>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pagination on the first page with disabled previous button.',
      },
    },
  },
}

// Last page
export const LastPage: Story = {
  render: () => (
    <PaginationScroller canGoPrev canGoNext={false}>
      <Pagination>
        <PaginationPrevious href="#" />
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">8</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">9</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              10
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationNext href="#" className="pointer-events-none opacity-50" />
      </Pagination>
    </PaginationScroller>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pagination on the last page with disabled next button.',
      },
    },
  },
}
