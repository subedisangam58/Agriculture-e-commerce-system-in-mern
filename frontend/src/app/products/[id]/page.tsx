import SingleProduct from "@/components/SingleProduct";

export default async function SingleProductPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return <SingleProduct productId={id} />;
}