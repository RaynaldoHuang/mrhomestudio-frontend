import type { ProductFormValues } from "./product-api"

export function toProductFormData(values: ProductFormValues): FormData {
  const formData = new FormData()

  formData.append("name", values.name)
  formData.append("category", values.category)
  formData.append("category_id", values.category_id === null ? "" : String(values.category_id))
  formData.append("brand_id", values.brand_id === null ? "" : String(values.brand_id))
  formData.append("price", String(values.price))
  formData.append("description", values.description)
  formData.append("is_active", values.is_active ? "1" : "0")
  formData.append("show_on_home", values.show_on_home ? "1" : "0")

  // Laravel treats an empty field as null; omitting it preserves the old data.
  if (values.specifications.length === 0) formData.append("specifications", "")
  if (values.variants.length === 0) formData.append("variants", "")

  values.specifications.forEach((specification, index) => {
    formData.append(`specifications[${index}][name]`, specification.name)
    formData.append(`specifications[${index}][value]`, specification.value)
  })
  values.variants.forEach((variant, variantIndex) => {
    formData.append(`variants[${variantIndex}][name]`, variant.name)
    variant.values.forEach((value, valueIndex) => {
      formData.append(`variants[${variantIndex}][values][${valueIndex}]`, value)
    })
  })
  values.images.forEach((image) => formData.append("images[]", image))
  values.remove_image_ids.forEach((id) => formData.append("remove_image_ids[]", String(id)))

  return formData
}

