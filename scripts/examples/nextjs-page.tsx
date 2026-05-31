"use client";

import { Button } from "@nqlib/nqui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nqlib/nqui";
import { Input } from "@nqlib/nqui";
import { Label } from "@nqlib/nqui";
import { Checkbox } from "@nqlib/nqui";
import { Separator } from "@nqlib/nqui";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <main className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to nqui
          </h1>
          <p className="text-muted-foreground">
            A React component library with enhanced UI components
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Example Form</CardTitle>
            <CardDescription>
              This demonstrates some of the nqui components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <Checkbox id="terms">
              Accept terms and conditions
            </Checkbox>
            <Separator />
            <div className="flex gap-2">
              <Button variant="default">Submit</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="success">Success</Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Edit <code className="rounded bg-muted px-1 py-0.5">app/page.tsx</code> to get started
          </p>
        </div>
      </main>
    </div>
  );
}

