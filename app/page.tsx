import { redirect } from 'next/navigation'

export default function Home() {
    redirect("/signIn") // redirige automatiquement vers la page de connexion
}
