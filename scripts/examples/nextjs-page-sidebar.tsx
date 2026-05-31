"use client";

import { Button } from "@nqlib/nqui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  TableOfContents,
  Input,
  Label,
  Checkbox,
  Separator,
} from "@nqlib/nqui";

export default function Home() {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex-1 min-w-0 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to My App</h1>
            <p className="text-muted-foreground">
              Sample 3-column layout: sidebar, main content, and table of contents (showcase-style).
            </p>
          </div>

          <section className="space-y-4">
            <h2 id="getting-started" className="text-xl font-semibold scroll-mt-6">
              Getting Started
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Quick start</CardTitle>
                <CardDescription>
                  Edit this page to start building your app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <Checkbox id="terms">Accept terms and conditions</Checkbox>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="default">Submit</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 id="next-steps" className="text-xl font-semibold scroll-mt-6">
              Next steps
            </h2>
            <p className="text-muted-foreground text-sm">
              Edit <code className="rounded bg-muted px-1 py-0.5">app/page.tsx</code> to get started.
            </p>
          </section>
        </div>
      </div>
      <aside className="w-56 shrink-0 border-l bg-muted/30 p-4 hidden lg:block overflow-y-auto">
        <TableOfContents
          autoDetect
          headingSelector="h2"
          variant="clerk"
          enableScrollSpy
          title="Contents"
          scrollOffset={80}
        />
      </aside>
    </div>
  );
}
