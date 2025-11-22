import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, HighlighterIcon, StickyNoteIcon, Share2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookChapter {
  id: string;
  title: string;
  chapterNumber: number;
  content: string;
  summary: string;
  isFree: boolean;
}

interface InteractiveBookReaderProps {
  chapter: BookChapter;
  hasAccess: boolean;
  onNavigate: (direction: "prev" | "next") => void;
}

export function InteractiveBookReader({
  chapter,
  hasAccess,
  onNavigate,
}: InteractiveBookReaderProps) {
  const { toast } = useToast();
  const [selectedText, setSelectedText] = useState("");
  const [highlights, setHighlights] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [notes, setNotes] = useState<Map<number, string>>(new Map());
  const [readingProgress, setReadingProgress] = useState(0);

  const canRead = chapter.isFree || hasAccess;

  const handleHighlight = async () => {
    if (!selectedText) return;

    const annotation = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      color: "yellow",
    };

    setHighlights([...highlights, annotation]);

    await apiRequest("POST", "/api/annotations", {
      chapterId: chapter.id,
      type: "highlight",
      selectedText,
      color: "yellow",
    });

    toast({
      title: "Highlighted",
      description: "Text saved to your highlights",
    });

    setSelectedText("");
  };

  const toggleBookmark = async () => {
    if (bookmarks.includes(0)) {
      setBookmarks(bookmarks.filter((b) => b !== 0));
    } else {
      setBookmarks([...bookmarks, 0]);
      await apiRequest("POST", "/api/annotations", {
        chapterId: chapter.id,
        type: "bookmark",
        position: 0,
      });
      toast({
        title: "Bookmarked",
        description: "Chapter added to your bookmarks",
      });
    }
  };

  if (!canRead) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Badge className="mb-4">Premium Content</Badge>
          <p className="text-muted-foreground mb-4">Purchase the book to read this chapter</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Chapter Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2">Chapter {chapter.chapterNumber}</Badge>
              <CardTitle className="text-3xl">{chapter.title}</CardTitle>
            </div>
            <Button
              variant={bookmarks.includes(0) ? "default" : "outline"}
              size="icon"
              onClick={toggleBookmark}
              data-testid="button-bookmark-chapter"
            >
              <BookmarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Reading Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Reading Progress</span>
          <span className="font-semibold">{readingProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Content with Interactive Features */}
      <div className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <Card>
              <CardContent className="prose prose-invert max-w-none p-6 text-base leading-relaxed">
                <div
                  className="select-text"
                  onMouseUp={() => {
                    const selected = window.getSelection()?.toString() || "";
                    if (selected.length > 10) {
                      setSelectedText(selected);
                    }
                  }}
                >
                  {chapter.content ? (
                    <p>{chapter.content.substring(0, 500)}...</p>
                  ) : (
                    <p>Chapter content loading...</p>
                  )}
                </div>

                {selectedText && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded">
                    <p className="text-sm mb-2 italic">"{selectedText}"</p>
                    <Button
                      size="sm"
                      onClick={handleHighlight}
                      className="gap-2"
                      data-testid="button-add-highlight"
                    >
                      <HighlighterIcon className="w-4 h-4" />
                      Add Highlight
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="highlights" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HighlighterIcon className="w-4 h-4" />
                  Your Highlights ({highlights.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {highlights.length > 0 ? (
                  highlights.map((hl) => (
                    <div key={hl.id} className="p-3 bg-yellow-900/20 rounded border border-yellow-600/30">
                      <p className="text-sm italic">"{hl.text}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No highlights yet. Select text to highlight.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <StickyNoteIcon className="w-4 h-4" />
                  Your Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  placeholder="Add chapter notes..."
                  className="w-full h-24 p-3 bg-muted border rounded-md text-sm mb-3"
                  data-testid="textarea-chapter-notes"
                />
                <Button size="sm" data-testid="button-save-notes">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chapter Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                  {chapter.summary}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid="button-share-summary"
                >
                  <Share2 className="w-4 h-4" />
                  Share Summary
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => onNavigate("prev")}
          data-testid="button-prev-chapter"
        >
          ← Previous Chapter
        </Button>
        <Button
          onClick={() => {
            setReadingProgress(100);
            onNavigate("next");
          }}
          data-testid="button-next-chapter"
        >
          Next Chapter →
        </Button>
      </div>
    </div>
  );
}
