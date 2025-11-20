"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, MapPin, Building, User, Briefcase } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { createOrganization, createCompany, createLocation } from "../actions";
import { createUserForOrg } from "~/app/actions/users";

type Client = {
  id: string;
  name: string;
  slug: string | null;
  companies: Company[];
  members: Member[];
};

type Company = {
  id: string;
  name: string;
  locations: Location[];
};

type Location = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export function ClientsList({ initialClients }: { initialClients: any[] }) {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Add Client Button & Form */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        {!isAddClientOpen ? (
          <Button onClick={() => setIsAddClientOpen(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">New Client</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAddClientOpen(false)}>Cancel</Button>
            </div>
            <form action={async (formData) => {
                await createOrganization(formData);
                setIsAddClientOpen(false);
            }} className="flex gap-4 items-end">
                <div className="space-y-1 flex-1">
                    <Label htmlFor="name">Client Name</Label>
                    <Input id="name" name="name" placeholder="Acme Corp" required />
                </div>
                <div className="space-y-1 flex-1">
                    <Label htmlFor="slug">Slug (ID)</Label>
                    <Input id="slug" name="slug" placeholder="acme-corp" required />
                </div>
                <Button type="submit">Create Client</Button>
            </form>
          </div>
        )}
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {initialClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"companies" | "users">("companies");

  return (
    <Card>
      <CardHeader className="p-4 pb-2 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <p className="text-xs text-gray-500 font-normal mt-1">Slug: {client.slug} • {client.companies.length} Companies • {client.members.length} Users</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {/* Status or other info could go here */}
            </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 pt-0 border-t bg-gray-50/50">
            <div className="flex border-b mb-4">
                <button 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "companies" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("companies")}
                >
                    Companies & Locations
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "users" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("users")}
                >
                    Users & Access
                </button>
            </div>

            {activeTab === "companies" && (
                <CompaniesSection organizationId={client.id} companies={client.companies} />
            )}

            {activeTab === "users" && (
                <UsersSection organizationId={client.id} members={client.members} />
            )}
        </CardContent>
      )}
    </Card>
  );
}

function CompaniesSection({ organizationId, companies }: { organizationId: string, companies: Company[] }) {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                {!isAdding ? (
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Company
                    </Button>
                ) : (
                    <div className="w-full bg-white p-3 rounded border shadow-sm">
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold">Add Company</h4>
                            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                         </div>
                         <form action={async (formData) => {
                             await createCompany(formData);
                             setIsAdding(false);
                         }} className="flex gap-3 items-end">
                             <input type="hidden" name="organizationId" value={organizationId} />
                             <div className="flex-1 space-y-1">
                                 <Label className="text-xs">Company Name</Label>
                                 <Input name="name" placeholder="East Coast Division" size={30} required />
                             </div>
                             <Button size="sm" type="submit">Add</Button>
                         </form>
                    </div>
                )}
            </div>

            {companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm italic bg-white rounded border border-dashed">
                    No companies added yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {companies.map(company => (
                        <CompanyCard key={company.id} company={company} />
                    ))}
                </div>
            )}
        </div>
    )
}

function CompanyCard({ company }: { company: Company }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAddingLoc, setIsAddingLoc] = useState(false);

    return (
        <div className="bg-white border rounded-md overflow-hidden">
            <div 
                className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">{company.name}</span>
                    <span className="text-xs text-gray-400">({company.locations.length} locations)</span>
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
            </div>

            {isExpanded && (
                <div className="p-3 pt-0 border-t bg-gray-50">
                    <div className="py-2 flex justify-end">
                         {!isAddingLoc ? (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsAddingLoc(true)}>
                                <Plus className="h-3 w-3 mr-1" /> Add Location
                            </Button>
                         ) : (
                            <div className="w-full bg-white p-3 rounded border mb-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-semibold">Add Location</h4>
                                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setIsAddingLoc(false)}>Cancel</Button>
                                </div>
                                <form action={async (formData) => {
                                    await createLocation(formData);
                                    setIsAddingLoc(false);
                                }} className="grid grid-cols-2 gap-2">
                                    <input type="hidden" name="companyId" value={company.id} />
                                    <div className="col-span-2">
                                        <Label className="text-xs">Name</Label>
                                        <Input name="name" placeholder="Main Office" className="h-8 text-sm" required />
                                    </div>
                                    <div>
                                        <Label className="text-xs">City</Label>
                                        <Input name="city" placeholder="New York" className="h-8 text-sm" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">State</Label>
                                        <Input name="state" placeholder="NY" className="h-8 text-sm" />
                                    </div>
                                    <div className="col-span-2 flex justify-end mt-1">
                                        <Button size="sm" className="h-7" type="submit">Add Location</Button>
                                    </div>
                                </form>
                            </div>
                         )}
                    </div>
                    
                    <div className="space-y-2 pl-2">
                        {company.locations.map(loc => (
                            <div key={loc.id} className="flex items-center gap-2 text-sm p-2 bg-white rounded border">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span className="font-medium">{loc.name}</span>
                                <span className="text-gray-400 text-xs ml-auto">
                                    {loc.city && loc.state ? `${loc.city}, ${loc.state}` : "No address"}
                                </span>
                            </div>
                        ))}
                        {company.locations.length === 0 && !isAddingLoc && (
                            <p className="text-xs text-gray-400 italic pl-2">No locations added.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function UsersSection({ organizationId, members }: { organizationId: string, members: Member[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                {!isAdding ? (
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Provision User
                    </Button>
                ) : (
                    <div className="w-full bg-white p-3 rounded border shadow-sm">
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold">Provision User</h4>
                            <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setTempPassword(null); }}>Close</Button>
                         </div>
                         
                         {tempPassword ? (
                             <div className="bg-green-50 p-3 rounded border border-green-200 mb-3">
                                 <p className="text-sm text-green-800 font-medium">User Created!</p>
                                 <p className="text-xs text-gray-600 mt-1">Temporary Password:</p>
                                 <code className="block bg-white p-2 mt-1 rounded border text-lg font-mono select-all">{tempPassword}</code>
                             </div>
                         ) : (
                             <form action={async (formData) => {
                                 const res = await createUserForOrg(formData);
                                 if (res.success && res.password) {
                                     setTempPassword(res.password);
                                 } else if (res.success) {
                                     // Existing user added
                                     setIsAdding(false);
                                 } else {
                                     alert(res.error);
                                 }
                             }} className="space-y-3">
                                 <input type="hidden" name="organizationId" value={organizationId} />
                                 <div className="grid grid-cols-3 gap-3">
                                     <div className="col-span-2 space-y-1">
                                         <Label className="text-xs">Email</Label>
                                         <Input name="email" type="email" placeholder="user@example.com" className="h-8 text-sm" required />
                                     </div>
                                     <div className="space-y-1">
                                         <Label className="text-xs">Role</Label>
                                         <select name="role" className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                             <option value="member">Member</option>
                                             <option value="admin">Admin</option>
                                             <option value="owner">Owner</option>
                                         </select>
                                     </div>
                                 </div>
                                 <div className="flex justify-end">
                                     <Button size="sm" className="h-7" type="submit">Provision</Button>
                                 </div>
                             </form>
                         )}
                    </div>
                )}
            </div>

            <div className="bg-white border rounded-md divide-y">
                {members.map(member => (
                    <div key={member.id} className="p-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium">{member.user.name}</p>
                                <p className="text-gray-500 text-xs">{member.user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium capitalize">
                                {member.role}
                            </span>
                        </div>
                    </div>
                ))}
                {members.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm italic">No users yet.</div>
                )}
            </div>
        </div>
    )
}

