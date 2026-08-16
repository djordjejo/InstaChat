using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.DBContext
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<ConversationMember> ConversationMembers { get; set; }
        public DbSet<MessageAttachment> MessageAttachments { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ---------- Kljucevi ----------

            modelBuilder.Entity<ConversationMember>()
                .HasKey(cm => new { cm.UserId, cm.ConversationId });

            // ---------- Veze ka KORISNIKU: Restrict ----------
            // Korisnik se ne brise kaskadno. Da je ovde Cascade, brisanje naloga
            // bi obrisalo i tudje razgovore u kojima je bio clan.
            // Vazniji razlog: SQL Server odbija "multiple cascade paths" - do
            // tabela Members i Messages sme da vodi samo JEDAN kaskadni put.

            modelBuilder.Entity<ConversationMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.ConversationMembers)
                .HasForeignKey(cm => cm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Conversation>()
                .HasOne(c => c.CreatedBy)
                .WithMany()
                .HasForeignKey(c => c.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // ---------- Veze ka RAZGOVORU: Cascade ----------
            // Ovo je izmena zbog koje brisanje razgovora uopste postaje moguce.
            // Ranije je ovde stajalo Restrict, pa je DELETE uvek padao na FK
            // constraint - svaki razgovor ima bar kreatora kao clana.
            //
            // Kaskadni put je jedinstven:
            //   Conversation -> Members
            //   Conversation -> Messages -> Attachments

            modelBuilder.Entity<ConversationMember>()
                .HasOne(cm => cm.Conversation)
                .WithMany(c => c.Members)
                .HasForeignKey(cm => cm.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MessageAttachment>()
                .HasOne(a => a.Message)
                .WithMany(m => m.Attachments)
                .HasForeignKey(a => a.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            // ---------- Ogranicenja kolona ----------

            modelBuilder.Entity<User>()
                .Property(u => u.Username)
                .HasMaxLength(50);

            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .HasMaxLength(100);

            modelBuilder.Entity<Message>()
                .Property(m => m.Content)
                .HasMaxLength(2000);

            // ---------- Indeksi ----------

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
