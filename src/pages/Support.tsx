
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FAQSection } from '@/components/FAQSection';
import { Contact } from '@/components/Contact';

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Support Center</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">How Can We Help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help you with any questions or issues you might have.
              Check out our FAQ section or reach out to us directly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Technical Support</h3>
                <p className="text-sm text-muted-foreground">
                  Having technical issues with our games or platform? Our tech team is ready to help.
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Billing Inquiries</h3>
                <p className="text-sm text-muted-foreground">
                  Questions about payments, refunds, or subscription issues? Our billing team can assist.
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Account Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Need help with account recovery, security, or profile settings? We're here to help.
                </p>
              </div>
              <div className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Game Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Stuck in a game or need gameplay tips? Our gaming experts can guide you.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <Contact />
          </div>
        </div>
        
        {/* Database-driven FAQ Section */}
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  );
}
