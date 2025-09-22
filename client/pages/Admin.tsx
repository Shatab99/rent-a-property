import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { properties as seedProperties } from "@/data/properties";
import type { Property } from "@/components/site/PropertyCard";

 type AdminListing = Property;
 type AdminUser = { id: string; name: string; email: string; role: "buyer" | "agent" | "admin"; active: boolean };
 type Inquiry = { id: string; propertyId: string; userEmail: string; createdAt: string };

export default function Admin() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [openListingDialog, setOpenListingDialog] = useState(false);
  const [editing, setEditing] = useState<AdminListing | null>(null);

  // Seed data on first load
  useEffect(() => {
    try {
      if (!localStorage.getItem("isAdmin")) {
        const email = localStorage.getItem("userEmail") || "";
        if (email.toLowerCase() === "admin@rentora.com") localStorage.setItem("isAdmin", "1");
      }
      const lsListings = localStorage.getItem("admin.listings");
      if (!lsListings) {
        localStorage.setItem("admin.listings", JSON.stringify(seedProperties));
      }
      const lsUsers = localStorage.getItem("admin.users");
      if (!lsUsers) {
        const seededUsers: AdminUser[] = [
          { id: "u1", name: "Admin", email: "admin@rentora.com", role: "admin", active: true },
          { id: "u2", name: "Jordan Lee", email: "jordan@example.com", role: "buyer", active: true },
          { id: "u3", name: "Alex Morgan", email: "alex.morgan@example.com", role: "agent", active: true },
        ];
        localStorage.setItem("admin.users", JSON.stringify(seededUsers));
      }
      const lsInquiries = localStorage.getItem("admin.inquiries");
      if (!lsInquiries) {
        const seeded: Inquiry[] = [
          { id: "q1", propertyId: "p1", userEmail: "jordan@example.com", createdAt: new Date().toISOString() },
          { id: "q2", propertyId: "p3", userEmail: "alex.morgan@example.com", createdAt: new Date().toISOString() },
        ];
        localStorage.setItem("admin.inquiries", JSON.stringify(seeded));
      }
    } catch {}
    loadAll();
  }, []);

  const loadAll = () => {
    try {
      setListings(JSON.parse(localStorage.getItem("admin.listings") || "[]"));
      setUsers(JSON.parse(localStorage.getItem("admin.users") || "[]"));
      setInquiries(JSON.parse(localStorage.getItem("admin.inquiries") || "[]"));
    } catch {}
  };

  const metrics = useMemo(() => ({
    totalListings: listings.length,
    totalUsers: users.length,
    totalInquiries: inquiries.length,
    activeAgents: users.filter(u => u.role === "agent" && u.active).length,
  }), [listings, users, inquiries]);

  return (
    <div className="bg-white">
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Manage listings, users, inquiries, and settings.</p>
            </div>
            <div className="text-sm text-muted-foreground">Signed in as <Badge variant="outline">{localStorage.getItem("userEmail")}</Badge></div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="listings">Listings</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Listings" value={metrics.totalListings} />
                  <MetricCard label="Users" value={metrics.totalUsers} />
                  <MetricCard label="Inquiries" value={metrics.totalInquiries} />
                  <MetricCard label="Active agents" value={metrics.activeAgents} />
                </div>
              </TabsContent>

              <TabsContent value="listings" className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Listings</h2>
                  <Dialog open={openListingDialog} onOpenChange={(o) => { setOpenListingDialog(o); if (!o) setEditing(null); }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditing(null)}>Add listing</Button>
                    </DialogTrigger>
                    <ListingDialog
                      listing={editing}
                      onSave={(l) => {
                        const next = editing ? listings.map(x => x.id === editing.id ? l : x) : [...listings, l];
                        localStorage.setItem("admin.listings", JSON.stringify(next));
                        setListings(next);
                        setOpenListingDialog(false);
                        toast.success(editing ? "Listing updated" : "Listing created");
                      }}
                    />
                  </Dialog>
                </div>
                <div className="overflow-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Beds</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-mono text-xs">{l.id}</TableCell>
                          <TableCell>{l.title}</TableCell>
                          <TableCell>{l.location}</TableCell>
                          <TableCell>${l.price.toLocaleString()}</TableCell>
                          <TableCell>{l.beds}</TableCell>
                          <TableCell className="space-x-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditing(l); setOpenListingDialog(true); }}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              const next = listings.filter(x => x.id !== l.id);
                              localStorage.setItem("admin.listings", JSON.stringify(next));
                              setListings(next);
                              toast.success("Listing deleted");
                            }}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <div className="overflow-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u, i) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-mono text-xs">{u.id}</TableCell>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch checked={u.active} onCheckedChange={(v) => {
                                const next = [...users];
                                next[i] = { ...u, active: Boolean(v) };
                                setUsers(next);
                                localStorage.setItem("admin.users", JSON.stringify(next));
                              }} />
                              <span className="text-sm text-muted-foreground">{u.active ? "Active" : "Suspended"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              const role = u.role === "buyer" ? "agent" : u.role === "agent" ? "admin" : "buyer";
                              const next = [...users];
                              next[i] = { ...u, role };
                              setUsers(next);
                              localStorage.setItem("admin.users", JSON.stringify(next));
                              toast.success("Role updated");
                            }}>Cycle role</Button>
                            <Button size="sm" variant="destructive" onClick={() => {
                              const next = users.filter(x => x.id !== u.id);
                              setUsers(next);
                              localStorage.setItem("admin.users", JSON.stringify(next));
                              toast.success("User removed");
                            }}>Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="inquiries" className="mt-6">
                <div className="overflow-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map(q => (
                        <TableRow key={q.id}>
                          <TableCell className="font-mono text-xs">{q.id}</TableCell>
                          <TableCell>{q.propertyId}</TableCell>
                          <TableCell>{q.userEmail}</TableCell>
                          <TableCell>{new Date(q.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">General</h2>
                    <div className="mt-4 grid gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site name</Label>
                        <Input id="siteName" defaultValue={localStorage.getItem("admin.siteName") || "Rentora"} onBlur={(e) => localStorage.setItem("admin.siteName", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support email</Label>
                        <Input id="supportEmail" type="email" defaultValue={localStorage.getItem("admin.supportEmail") || "support@rentora.com"} onBlur={(e) => localStorage.setItem("admin.supportEmail", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">Announcements</h2>
                    <div className="mt-4 grid gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="bannerText">Banner text</Label>
                        <Textarea id="bannerText" placeholder="Enter a site-wide announcement" defaultValue={localStorage.getItem("admin.banner") || ""} onBlur={(e) => localStorage.setItem("admin.banner", e.target.value)} />
                      </div>
                      <Button variant="outline" onClick={() => toast.success("Settings saved")}>Save changes</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ListingDialog({ listing, onSave }: { listing: AdminListing | null; onSave: (l: AdminListing) => void }) {
  const [form, setForm] = useState<AdminListing>(() => listing || {
    id: `p${Math.random().toString(36).slice(2, 7)}`,
    title: "Untitled listing",
    price: 2000,
    location: "City, State",
    beds: 1,
    baths: 1,
    sqft: 700,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop",
    images: [],
    pets: { cats: false, dogs: false },
    amenities: [],
  });
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{listing ? "Edit listing" : "Add listing"}</DialogTitle>
        <DialogDescription>Manage core details for this listing.</DialogDescription>
      </DialogHeader>
      <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="l-title">Title</Label>
            <Input id="l-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-location">Location</Label>
            <Input id="l-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="l-price">Price ($/mo)</Label>
            <Input id="l-price" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-beds">Beds</Label>
            <Input id="l-beds" type="number" min={0} value={form.beds} onChange={(e) => setForm({ ...form, beds: Number(e.target.value) })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-baths">Baths</Label>
            <Input id="l-baths" type="number" min={0} value={form.baths} onChange={(e) => setForm({ ...form, baths: Number(e.target.value) })} required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="l-sqft">Square feet</Label>
            <Input id="l-sqft" type="number" min={0} value={form.sqft} onChange={(e) => setForm({ ...form, sqft: Number(e.target.value) })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-image">Image URL</Label>
            <Input id="l-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="l-images">Gallery image URLs (comma separated)</Label>
          <Textarea id="l-images" value={(form.images || []).join(", ")} onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
        </div>
        <div className="pt-2"><Button type="submit">{listing ? "Save changes" : "Create listing"}</Button></div>
      </form>
    </DialogContent>
  );
}
