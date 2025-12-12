export default function Footer() {
  return (
    <footer className="w-full text-center py-8 mt-20 bg-zinc-950 border-t border-white/5">
      <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} HealTrip. All Rights Reserved.</p>
    </footer>
  );
}