using NakedObjects.Boot;
using NakedObjects.Core.Context;
using NakedObjects.Core.NakedObjectsSystem;
using NakedObjects.EntityObjectStore;
using NakedObjects.Web.Mvc;
using NakedObjects.Web.Mvc.Helpers;
using NakedObjects.Services;
using CodeFirstExample;

namespace RunMVC.App_Start {
    public class RunWeb : RunMvc {
        protected override NakedObjectsContext Context {
            get { return HttpContextContext.CreateInstance(); }
        }

        protected override IServicesInstaller MenuServices {
            get {
                return new ServicesInstaller(new object[] { new SimpleRepository<Customer>(), new SimpleRepository<Product>() });
            }
        }

        protected override IServicesInstaller ContributedActions {
            get { return new ServicesInstaller(new object[] {}); }
        }

        protected override IServicesInstaller SystemServices {
            get { return new ServicesInstaller(new object[] {new SimpleEncryptDecrypt()}); }
        }

        protected override IObjectPersistorInstaller Persistor
        {
            get
            {
                return new EntityPersistorInstaller
                {
                    CodeFirst = true,
                    CodeFirstConfig = new[] {
                    new EntityPersistorInstaller.EntityCodeFirstConfig {AssemblyName = "CodeFirstExample", DataSource = @".\SqlExpress", DatabaseName = "database1"}}
                };
            }
        }
        public static void Run() {
            new RunWeb().Start();
        }
    }
}