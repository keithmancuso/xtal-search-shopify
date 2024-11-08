import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  console.log("Session:", session);
  console.log("Prisma client:", prisma);
  
  try {
    const settings = await prisma.settings.findUnique({
      where: { shop: session.shop },
    });
    console.log("Settings found:", settings);
    
    return json({ 
      settings,
      shop: session.shop 
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const openAiKey = formData.get("openAiKey");

  await prisma.settings.upsert({
    where: { shop: session.shop },
    create: {
      shop: session.shop,
      openAiKey,
    },
    update: {
      openAiKey,
    },
  });

  return json({ status: "success" });
};

export default function SettingsPage() {
  const { settings } = useLoaderData();
  const [openAiKey, setOpenAiKey] = useState(settings?.openAiKey || "");
  const submit = useSubmit();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("openAiKey", openAiKey);
    submit(formData, { method: "POST" });
  };

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">
                OpenAI Configuration
              </Text>
              <FormLayout>
                <TextField
                  label="OpenAI API Key"
                  type="password"
                  value={openAiKey}
                  onChange={setOpenAiKey}
                  autoComplete="off"
                  helpText="Enter your OpenAI API key to enable AI features"
                />
                <Button primary onClick={handleSubmit}>
                  Save
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}