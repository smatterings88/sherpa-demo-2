import { upsertGhlDemoContactAndTag } from '../api/_lib/ghlDemo.js'

const stamp = Date.now()
const email = `sherpa-demo-test+${stamp}@example.com`

async function main() {
  const t1 = await upsertGhlDemoContactAndTag({
    email,
    name: 'Sherpa Demo Test',
    tag: 'sherpa demo--> submitted transcript',
  })

  const t2 = await upsertGhlDemoContactAndTag({
    email,
    name: 'Sherpa Demo Test',
    tag: 'sherpa demo--> submitted transcript',
  })

  const t3 = await upsertGhlDemoContactAndTag({
    email,
    name: 'Sherpa Demo Test',
    tag: 'sherpa demo--> did test call',
  })

  for (const row of [t1, t2, t3]) {
    process.stdout.write(
      `${JSON.stringify({
        contactId: row.contactId,
        contactCreated: row.contactCreated,
        tag: row.tag,
        tagAction: row.tagAction,
      })}\n`,
    )
  }
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
  process.exitCode = 1
})
