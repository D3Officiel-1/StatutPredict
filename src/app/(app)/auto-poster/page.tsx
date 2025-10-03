
import AutoPoster from "@/components/poster/auto-poster";

export default function AutoPosterPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auto-Poster IA</h1>
        <p className="text-muted-foreground mt-2">
          Générez et publiez automatiquement du contenu sur votre canal Telegram grâce à l'IA.
        </p>
      </div>
      <AutoPoster />
    </div>
  )
}
