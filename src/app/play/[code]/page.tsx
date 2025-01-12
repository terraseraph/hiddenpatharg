import { redirect } from "next/navigation";

interface Props {
    params: Promise<{
        code: string;
    }>;
}

export default async function PlayRedirect({ params }: Props) {
    const { code } = await params;
    redirect(`/play/${code}/info`);
} 