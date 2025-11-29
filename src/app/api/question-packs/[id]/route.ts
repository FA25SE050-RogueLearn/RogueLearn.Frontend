import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('question_packs')
      .select('content')
      .eq('id', id)
      .single()
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 })
    }
    return new NextResponse(JSON.stringify(data.content), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}