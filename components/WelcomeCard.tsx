// components/WelcomeCard.tsx
type WelcomeCardProps = {
  userName: string;
  recipientName: string;
};

export function WelcomeCard({ userName, recipientName }: WelcomeCardProps) {
  return (
    <section className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Welcome, {userName}!</h2>
      <p>You are the Secret Santa for: <span className="font-bold">{recipientName}</span></p>
      <p className="text-sm text-gray-600 mt-2">
        Update your wishlist and check what your recipient is hoping to receive.
      </p>
    </section>
  );
}
