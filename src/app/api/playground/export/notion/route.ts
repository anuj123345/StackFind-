import { NextRequest, NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function POST(req: NextRequest) {
  try {
    const { idea, stack, output } = await req.json()
    
    const notionToken = process.env.NOTION_TOKEN
    const parentPageId = process.env.NOTION_PARENT_PAGE_ID

    if (!notionToken || !parentPageId) {
      return NextResponse.json(
        { error: "Notion configuration missing (NOTION_TOKEN or NOTION_PARENT_PAGE_ID)" },
        { status: 500 }
      )
    }

    const notion = new Client({ auth: notionToken })

    // 1. Create the page structure
    const blocks: any[] = [
      {
        object: "block",
        type: "callout",
        callout: {
          rich_text: [{ type: "text", text: { content: idea } }],
          icon: { emoji: "💡" },
          color: "blue_background"
        }
      },
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "Tech Stack" } }]
        }
      },
      {
        object: "block",
        type: "table",
        table: {
          table_width: 3,
          has_column_header: true,
          children: [
            {
              type: "table_row",
              table_row: {
                cells: [
                  [{ type: "text", text: { content: "Tool" } }],
                  [{ type: "text", text: { content: "Category" } }],
                  [{ type: "text", text: { content: "Pricing" } }]
                ]
              }
            },
            ...stack.map((t: any) => ({
              type: "table_row",
              table_row: {
                cells: [
                  [{ type: "text", text: { content: t.name } }],
                  [{ type: "text", text: { content: t.categories?.[0] || "-" } }],
                  [{ type: "text", text: { content: t.pricingModel || "-" } }]
                ]
              }
            }))
          ]
        }
      },
      {
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: [{ type: "text", text: { content: "Build Plan" } }]
        }
      }
    ]

    // 2. Simple Markdown to Notion Block Conversion
    const lines = output.split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith("## ")) {
        blocks.push({
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ type: "text", text: { content: trimmed.replace("## ", "") } }] }
        })
      } else if (trimmed.startsWith("### ")) {
        blocks.push({
          object: "block",
          type: "heading_3",
          heading_3: { rich_text: [{ type: "text", text: { content: trimmed.replace("### ", "") } }] }
        })
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: { rich_text: [{ type: "text", text: { content: trimmed.substring(2) } }] }
        })
      } else if (/^\d+\. /.test(trimmed)) {
        blocks.push({
          object: "block",
          type: "numbered_list_item",
          numbered_list_item: { rich_text: [{ type: "text", text: { content: trimmed.replace(/^\d+\. /, "") } }] }
        })
      } else {
        // Normal paragraph, but check for bold
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: { 
            rich_text: [{ 
              type: "text", 
              text: { content: trimmed.replace(/\*\*/g, "") } // Simple strip bold for now
            }] 
          }
        })
      }
    }

    const response = await notion.pages.create({
      parent: { page_id: parentPageId },
      icon: { emoji: "🚀" },
      cover: {
        type: "external",
        external: { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80" }
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: `Project Blueprint: ${idea.substring(0, 50)}${idea.length > 50 ? "..." : ""}`
              }
            }
          ]
        }
      },
      children: blocks.slice(0, 100) // Notion has a limit of 100 children per request
    })

    return NextResponse.json({ success: true, url: (response as any).url })
  } catch (error: any) {
    console.error("Notion Export Error:", error)
    return NextResponse.json({ error: error.message || "Failed to export to Notion" }, { status: 500 })
  }
}
