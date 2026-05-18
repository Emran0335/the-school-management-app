type UserManagementPageProps = {
  role: string;
  title: string;
  description: string;
};

export default function UserManagementPage({
  role,
  title,
  description,
}: UserManagementPageProps) {
  return (
    <div>
      <p>{role}</p>
      <p>{title}</p>
      <p>{description}</p>
    </div>
  );
}
