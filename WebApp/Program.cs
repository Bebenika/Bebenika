namespace WebApp
{
    public class Program
    {
        public static void Main(string[] args)
       {
            var builder = WebApplication.CreateBuilder(args);


            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            var app = builder.Build();


            if (app.Environment.IsDevelopment())
            {

            }
            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new
                 List<string> { "index.html" }  //Başlama sayfası
            });



            app.UseStaticFiles();
            app.MapControllers();




            app.Run();
        }
    }
}
