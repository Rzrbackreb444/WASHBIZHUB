import { Helmet } from "react-helmet-async";

function sanitizeSchemaObject<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => 
    value === undefined || value === null || value === '' || 
    (Array.isArray(value) && value.length === 0) ? undefined : value
  ));
}

interface JsonLdProps {
  schema: object | object[];
}

export function JsonLd({ schema }: JsonLdProps) {
  if (!schema) return null;
  
  const schemas = Array.isArray(schema) ? schema : [schema];
  
  if (schemas.length === 0) return null;

  return (
    <Helmet>
      {schemas.map((schemaItem, index) => {
        if (!schemaItem || Object.keys(schemaItem).length === 0) return null;
        
        const sanitizedSchema = sanitizeSchemaObject(schemaItem);
        
        return (
          <script 
            key={`jsonld-${index}`} 
            type="application/ld+json"
          >
            {JSON.stringify(sanitizedSchema)}
          </script>
        );
      })}
    </Helmet>
  );
}

export default JsonLd;
