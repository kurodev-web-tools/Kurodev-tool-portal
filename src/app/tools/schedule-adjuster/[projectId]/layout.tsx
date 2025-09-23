export async function generateStaticParams() {
  return [{ projectId: 'test' }];
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
