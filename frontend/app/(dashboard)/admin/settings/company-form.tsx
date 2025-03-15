import { Input } from "@/components/ui/input";

import { Form, FormControl, FormItem, FormLabel, FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const companyFormSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address"),
    currency: z.enum(["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR", "AED"]),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const fetchCompany = async (companyId: string) => {
    if (!companyId) return null;
    const response = await api.get(`/company/${companyId}`);
    return response.data;
};

const CompanyForm = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: company } = useQuery({
        queryKey: ["company"],
        queryFn: () => fetchCompany(user?.companyId || ""),
    });

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: company?.name || "",
            phone: company?.phone || "",
            email: company?.email || "",
            currency: company?.currency || "USD",
        }
    });

    const updateCompany = useMutation({
        mutationFn: async (values: CompanyFormValues) => {
            console.log(values);
            const response = await api.put(`/company/${user?.companyId}`, values);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company"] });
            toast.success("Company details updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update company details");
        },
    });

    const onSubmit = (data: CompanyFormValues) => {
        updateCompany.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                <div className='grid grid-cols-2 gap-6 gap-y-6'>
                    <div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || company?.name} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || company?.phone} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* make 2 inputs one for email and one for usercount which will be readonly */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || company?.email} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormItem>
                            <FormLabel>Plan Name</FormLabel>
                            <FormControl>
                                <Input
                                    value={company?.plan?.name || "No plan"}
                                    readOnly
                                    disabled
                                />
                            </FormControl>
                        </FormItem>

                        <FormItem>
                            <FormLabel>Plan End Date</FormLabel>
                            <FormControl>
                                <Input
                                    value={company?.planEnd ? new Date(company.planEnd).toLocaleDateString() : "No end date"}
                                    readOnly
                                    disabled
                                />
                            </FormControl>
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <FormControl>
                                        <select
                                            {...field}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="AED">AED (AED)</option>
                                        </select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        type="submit"
                        disabled={updateCompany.isPending || !form.formState.isDirty}
                    >
                        {updateCompany.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update Company'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CompanyForm;