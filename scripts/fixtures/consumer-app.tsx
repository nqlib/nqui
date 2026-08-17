/**
 * Packed-tarball consumer fixture. Typechecked against the *extracted npm pack*,
 * not library source. Source `ComponentProps<typeof EnhancedTabsList>` can pass
 * while the published `.d.ts` drops children / className / variant (0.7.8–0.7.9).
 */
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@nqlib/nqui"

export function PackedTypesSmoke() {
  return (
    <>
      <Button className="px-2">Ok</Button>
      <Tabs defaultValue="a">
        <TabsList className="w-full" aria-label="Surfaces" variant="line">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">one</TabsContent>
      </Tabs>
    </>
  )
}
